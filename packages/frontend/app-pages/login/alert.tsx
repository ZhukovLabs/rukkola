import React from 'react';
import { Alert } from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

type LoginAlertProps = {
  message: string;
  status: 'success' | 'error';
  successTitle?: string;
  errorTitle?: string;
};

export const LoginAlert = ({
  message,
  status,
  successTitle,
  errorTitle,
}: LoginAlertProps) => (
  <Alert.Root
    mb={4}
    borderRadius="md"
    p={3}
    bg={status === 'success' ? 'green.500/10' : 'red.500/10'}
    color={status === 'success' ? 'green.400' : 'red.400'}
    border="1px solid"
    borderColor={status === 'success' ? 'green.500/20' : 'red.500/20'}
    role="alert"
    aria-live="polite"
  >
    <Alert.Indicator>
      {status === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
    </Alert.Indicator>
    <Alert.Content>
      <Alert.Title fontWeight="medium">
        {status === 'success' ? successTitle : errorTitle}
      </Alert.Title>
      <Alert.Description fontSize="sm">{message}</Alert.Description>
    </Alert.Content>
  </Alert.Root>
);

