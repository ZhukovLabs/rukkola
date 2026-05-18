import React from 'react';
import { Button } from '@chakra-ui/react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { InputField } from '@/components/input-field';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type PasswordFieldProps = {
  register: UseFormRegisterReturn;
  error?: FieldError;
  showPassword: boolean;
  toggleShowPassword: () => void;
  placeholder: string;
  showPasswordText: string;
  hidePasswordText: string;
};

export const PasswordField = ({
  register,
  error,
  showPassword,
  toggleShowPassword,
  placeholder,
  showPasswordText,
  hidePasswordText,
}: PasswordFieldProps) => (
  <InputField
    icon={<FiLock />}
    placeholder={placeholder}
    type={showPassword ? 'text' : 'password'}
    register={register}
    error={error}
    rightElement={
      <Button
        variant="ghost"
        size="sm"
        color="gray.400"
        _hover={{ bg: 'whiteAlpha.100', color: 'gray.200' }}
        onClick={toggleShowPassword}
        aria-label={showPassword ? hidePasswordText : showPasswordText}
        type="button"
      >
        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </Button>
    }
  />
);

