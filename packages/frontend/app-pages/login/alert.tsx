import React from "react";
import {Alert} from "@chakra-ui/react";
import {FiAlertCircle} from "react-icons/fi";

type LoginAlertProps = {
    message: string;
    status: "success" | "error";
    successTitle?: string;
    errorTitle?: string;
}

export const LoginAlert = ({message, status, successTitle, errorTitle}: LoginAlertProps) => (
    <Alert.Root
        mb={4}
        borderRadius="md"
        p={3}
        bg={status === "success" ? "green.500" : "red.500"}
        color="white"
        role="alert"
        aria-live="polite"
    >
        <Alert.Indicator>
            <FiAlertCircle/>
        </Alert.Indicator>
        <Alert.Content>
            <Alert.Title>
                {status === "success" ? successTitle : errorTitle}
            </Alert.Title>
            <Alert.Description>{message}</Alert.Description>
        </Alert.Content>
    </Alert.Root>
);
