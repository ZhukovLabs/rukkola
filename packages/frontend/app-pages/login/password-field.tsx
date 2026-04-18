import React from "react";
import {Button} from "@chakra-ui/react";
import {FiLock, FiEye, FiEyeOff} from "react-icons/fi";
import {InputField} from "@/components/input-field";
import {FieldError, UseFormRegisterReturn} from "react-hook-form";

type PasswordFieldProps= {
    register: UseFormRegisterReturn;
    error?: FieldError;
    showPassword: boolean;
    toggleShowPassword: VoidFunction;
    placeholder: string;
    showPasswordText: string;
    hidePasswordText: string;
}

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
        icon={<FiLock/>}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        register={register}
        error={error}
        rightElement={
            <Button
                variant="ghost"
                size="sm"
                color="gray.300"
                _hover={{bg: "transparent", color: "gray.300"}}
                onClick={toggleShowPassword}
                aria-label={showPassword ? hidePasswordText : showPasswordText}
                type="button"
            >
                {showPassword ? <FiEyeOff/> : <FiEye/>}
            </Button>
        }
    />
);
