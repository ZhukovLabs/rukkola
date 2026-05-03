"use client";

import {
  Box,
  Heading,
  Text,
  Badge,
  Spinner,
  Center,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auditLogsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { AuditLogDto } from "@rukkola/shared";
import { FiRefreshCw } from "react-icons/fi";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const fetchLogs = async (pageNum: number = page) => {
    setLoading(true);
    try {
      const response = await auditLogsApi.getLogs(pageNum, PAGE_SIZE);
      if (response.success && response.data) {
        setLogs(response.data.logs);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchLogs(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <VStack align="start" gap={1}>
          <Heading size="lg">История изменений</Heading>
          <Text color="gray.400">Отслеживание действий администраторов</Text>
        </VStack>
          <IconButton
            aria-label="Refresh logs"
            onClick={() => fetchLogs(1)}
            loading={loading}
            variant="outline"
            borderColor="gray.700"
            _hover={{ bg: "gray.800" }}
          >
            <FiRefreshCw />
          </IconButton>
      </HStack>

      <Box
        bg="gray.800"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.700"
        overflow="hidden"
      >
        {loading && logs.length === 0 ? (
          <Center p={10}>
            <Spinner size="xl" color="gray.400" />
          </Center>
        ) : logs.length === 0 ? (
          <Center p={10}>
            <Text color="gray.400">История изменений пуста</Text>
          </Center>
        ) : (
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--chakra-colors-gray-900)' }}>
                  <th style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', color: 'var(--chakra-colors-gray-500)', padding: '12px', textAlign: 'left' }}>Пользователь</th>
                  <th style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', color: 'var(--chakra-colors-gray-500)', padding: '12px', textAlign: 'left' }}>Действие</th>
                  <th style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', color: 'var(--chakra-colors-gray-500)', padding: '12px', textAlign: 'left' }}>Детали</th>
                  <th style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', color: 'var(--chakra-colors-gray-500)', padding: '12px', textAlign: 'left' }}>Дата</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--chakra-colors-gray-750)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', padding: '12px' }}>
                      <div>
                        <Text fontWeight="bold">{log.user.name}</Text>
                        <Text fontSize="xs" color="gray.500">@{log.user.username}</Text>
                      </div>
                    </td>
                    <td style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', padding: '12px' }}>
                      <Badge
                        colorScheme={
                          log.action.includes('Удаление') ? 'red' :
                          log.action.includes('Создание') ? 'green' :
                          'blue'
                        }
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', padding: '12px' }}>
                      <Text color="gray.300" fontSize="sm">{log.details}</Text>
                    </td>
                    <td style={{ borderBottom: '1px solid var(--chakra-colors-gray-700)', padding: '12px', whiteSpace: 'nowrap' }}>
                      <Text color="gray.400" fontSize="sm">{formatDate(log.createdAt)}</Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      {totalPages > 1 && (
        <Center mt={6}>
          <VStack gap={2}>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <Text color="gray.500" fontSize="sm">
              Всего записей: {total}
            </Text>
          </VStack>
        </Center>
      )}
    </Box>
  );
}
