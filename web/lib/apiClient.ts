export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('sessionToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    };
  
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }