import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryKey
} from '@tanstack/react-query';

interface CrudHooks<T> {
    useList: (params?: Record<string, string | number>) => ReturnType<typeof useQuery<{ data: T[] }>>;
    useOne: (id: string) => ReturnType<typeof useQuery<{ data: T }>>;
    useCreate: () => ReturnType<typeof useMutation<{ data: T }, unknown, T>>;
    useUpdate: () => ReturnType<typeof useMutation<{ data: T }, unknown, { id: string; data: T }>>;
    useDelete: () => ReturnType<typeof useMutation<{ data: T }, unknown, string>>;
}

interface CrudActions<T> {
    list: (params?: Record<string, string | number>) => Promise<{ data: T[] }>;
    one: (id: string) => Promise<{ data: T }>;
    create: (data: T) => Promise<{ data: T }>;
    update: (id: string, data: T) => Promise<{ data: T }>;
    delete: (id: string) => Promise<{ data: T }>;
  }

export function createCrudHooks<T>(
    baseKey: QueryKey,
    actions: CrudActions<T>
): CrudHooks<T> {
    return {
        useList: (params?: Record<string, string | number>) => {
            return useQuery({
                queryKey: [baseKey, 'list', params],
                queryFn: () => actions.list(params)
            });
        },

        useOne: (id: string) => {
            return useQuery({
                queryKey: [baseKey, 'one', id],
                queryFn: () => actions.one(id)
            });
        },

        useCreate: () => {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: actions.create,
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [baseKey] });
                }
            });
        },

        useUpdate: () => {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: ({ id, data }: { id: string; data: T }) =>
                    actions.update(id, data),
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [baseKey] });
                }
            });
        },

        useDelete: () => {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: actions.delete,
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [baseKey] });
                }
            });
        }
    };
}