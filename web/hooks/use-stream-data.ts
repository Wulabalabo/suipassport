import { useState, useCallback, useRef, useEffect } from 'react';

interface StreamOptions<T> {
  onData?: (data: T[]) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useStreamData<T>() {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const dataRef = useRef<T[]>([]);
  const optionsRef = useRef<StreamOptions<T>>({});
  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const processStream = useCallback(async (
    url: string,
    options: StreamOptions<T> = {}
  ) => {
    // 防止重复调用
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      setData([]);
      dataRef.current = [];
      optionsRef.current = options;

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let batch: T[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // 处理最后一批数据
          if (batch.length > 0) {
            dataRef.current = [...dataRef.current, ...batch];
            setData(dataRef.current);
            optionsRef.current.onData?.(dataRef.current);
          }
          optionsRef.current.onComplete?.();
          setIsLoading(false);
          isProcessingRef.current = false;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsedBatch = JSON.parse(line);
              batch = batch.concat(parsedBatch);

              // 当批次达到一定大小时，更新状态
              if (batch.length >= 1000) {
                dataRef.current = [...dataRef.current, ...batch];
                setData(dataRef.current);
                optionsRef.current.onData?.(dataRef.current);
                batch = [];
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (err) {
      // 如果是取消请求，不设置错误
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const error = err instanceof Error ? err : new Error('Failed to process stream');
      setError(error);
      optionsRef.current.onError?.(error);
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    dataRef.current = [];
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    processStream,
    clearData
  };
} 