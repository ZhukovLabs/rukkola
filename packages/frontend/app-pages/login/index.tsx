'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  VStack,
  Text,
  Icon,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { FiUser, FiLock } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { useAuth } from '@/lib/auth/auth-context';
import { InputField } from '@/components/input-field';

import { loginSchema, type LoginFormData } from './validation';
import { LOGIN_TEXTS } from './config';
import { LoginAlert } from './alert';
import { PasswordField } from './password-field';
import { HCaptcha } from './hcaptcha';

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

const MotionBox = motion.create(Box);

export const LoginPage = () => {
  const { status, login } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    status: 'success' | 'error';
  } | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    resetField,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { username: '', password: '', captchaToken: '' },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData & { token?: string }) => {
      const result = await login(
        data.username,
        data.password,
        data.token || undefined,
      );
      if (!result.ok) {
        throw new Error(result.error || LOGIN_TEXTS.alert.defaultErrorMessage);
      }
      return result;
    },
    retry: 0,
    onSuccess: () => {
      setAlert({ message: LOGIN_TEXTS.alert.successMessage, status: 'success' });
    },
    onError: (error: Error) => {
      setAlert({ message: error.message, status: 'error' });
      setCaptchaToken(null);
      setCaptchaResetKey((k) => k + 1);
      resetField('password');
    },
  });

  const toggleShowPassword = useCallback(() => setShowPassword((v) => !v), []);

  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const onSubmit = (data: LoginFormData) => {
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setAlert({ message: LOGIN_TEXTS.captchaPlaceholder, status: 'error' });
      return;
    }
    loginMutation.mutate({ ...data, token: captchaToken ?? undefined });
  };

  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <Center minH="100vh" bg="gray.950">
        <VStack gap={4}>
          <Spinner color="white" size="xl" />
          <Text color="gray.400" fontWeight="medium">
            {LOGIN_TEXTS.loading}
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.950"
      p={4}
      data-testid="login-page"
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        w="full"
        maxW="md"
        bg="gray.900"
        p={{ base: 6, md: 10 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.800"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.9)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bgGradient="linear(to-r, gray.600, gray.400, gray.600)"
        />

        <VStack gap={6} mb={8}>
          <Box
            p={4}
            bg="gray.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.700"
          >
            <Icon as={MdDashboard} color="white" boxSize={10} />
          </Box>
          <VStack gap={1}>
            <Heading
              textAlign="center"
              fontSize={{ base: '2xl', md: '3xl' }}
              color="white"
              fontWeight="bold"
            >
              {LOGIN_TEXTS.pageTitle}
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Войдите для доступа к панели управления
            </Text>
          </VStack>
        </VStack>

        {alert && (
          <LoginAlert
            {...alert}
            successTitle={LOGIN_TEXTS.alert.successTitle}
            errorTitle={LOGIN_TEXTS.alert.errorTitle}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <VStack gap={5}>
            <InputField
              icon={<FiUser />}
              placeholder={LOGIN_TEXTS.usernamePlaceholder}
              register={register('username')}
              error={errors.username}
            />
            <PasswordField
              register={register('password')}
              error={errors.password}
              showPassword={showPassword}
              toggleShowPassword={toggleShowPassword}
              placeholder={LOGIN_TEXTS.passwordPlaceholder}
              showPasswordText={LOGIN_TEXTS.showPassword}
              hidePasswordText={LOGIN_TEXTS.hidePassword}
            />

            {HCAPTCHA_SITE_KEY && (
              <Box w="full" display="flex" justifyContent="center" py={2}>
                <HCaptcha
                  theme="dark"
                  key={captchaResetKey}
                  siteKey={HCAPTCHA_SITE_KEY}
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                  onError={handleCaptchaExpire}
                  resetKey={captchaResetKey}
                />
              </Box>
            )}

            <Button
              type="submit"
              w="full"
              size="lg"
              mt={2}
              bg="white"
              color="gray.950"
              fontWeight="bold"
              fontSize="md"
              textTransform="uppercase"
              letterSpacing="wider"
              _hover={{
                bg: 'gray.200',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(255, 255, 255, 0.1)',
              }}
              _active={{
                bg: 'gray.300',
                transform: 'translateY(0)',
              }}
              _disabled={{
                opacity: 0.4,
                cursor: 'not-allowed',
                bg: 'gray.600',
                color: 'gray.400',
              }}
              loading={loginMutation.isPending}
              disabled={!isValid || loginMutation.isPending}
              loadingText={LOGIN_TEXTS.loginButtonLoading}
              aria-label={LOGIN_TEXTS.loginButton}
              transition="all 0.2s ease"
              borderRadius="xl"
            >
              <Flex align="center" gap={3}>
                <Icon as={FiLock} boxSize={5} />
                <Text>{LOGIN_TEXTS.loginButton}</Text>
              </Flex>
            </Button>
          </VStack>
        </form>
      </MotionBox>
    </Flex>
  );
};

