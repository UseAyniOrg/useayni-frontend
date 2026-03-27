import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { authService } from '@/lib/authService';
import { useAuthContext } from '@/contexts/AuthContext';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RolesAndPermissionsData {
  memberId: string;
  memberName: string;
  roles: Role[];
}

interface UseRolesAndPermissionsReturn {
  data: RolesAndPermissionsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRolesAndPermissions(): UseRolesAndPermissionsReturn {
  const { memberId } = useAuthContext();
  const [data, setData] = useState<RolesAndPermissionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRolesAndPermissions = async () => {
    if (!memberId) {
      setError(new Error('Member ID is not set'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const response = await api.get<RolesAndPermissionsData>(
        `/members/${memberId}/roles-and-permissions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setData(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch roles and permissions');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchRolesAndPermissions();
    }
  }, [memberId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRolesAndPermissions,
  };
}
