import React from "react";
import type {FieldError, UseFormRegisterReturn} from "react-hook-form";
import {Box, Input, Text} from "@chakra-ui/react";
import {FiAlertCircle} from "react-icons/fi";

type InputFieldProps = {
    icon: React.ReactNode;
    placeholder: string;
    type?: string;
    register: UseFormRegisterReturn;
    error?: FieldError;
    rightElement?: React.ReactNode;
};

export const InputField = ({icon, placeholder, type = "text", register, error, rightElement}: InputFieldProps) => {
    return (
        <Box w="full">
            <Box position="relative">
                <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                    pointerEvents="none"
                    zIndex={999}
                >
                    {icon}
                </Box>
                <Input
                    {...register}
                    type={type}
                    placeholder={placeholder}
                    pl={10}
                    pr={rightElement ? 12 : 4}
                    py={3}
                    bg="gray.800"
                    borderRadius="lg"
                    borderColor={error ? "red.400" : "gray.700"}
                    color="white"
                    _placeholder={{color: "gray.400"}}
                    _focus={{borderColor: "gray.400", boxShadow: "0 0 0 1px gray.400"}}
                    aria-invalid={!!error}
                />
                {rightElement && (
                    <Box position="absolute" right={2} top="50%" transform="translateY(-50%)">
                        {rightElement}
                    </Box>
                )}
            </Box>
            {error && (
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <FiAlertCircle color="#f56565"/>
                    <Text fontSize="sm" color="red.400">
                        {error.message}
                    </Text>
                </Box>
            )}
        </Box>
    );
}
