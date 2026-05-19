'use client'

import React, { useEffect, useState, useTransition } from 'react'
import {
    Alert,
    Box,
    Button,
    Text,
    VStack,
    Flex,
    SimpleGrid,
    Icon,
    Spinner,
    Center,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    FiMapPin,
    FiCheckCircle,
    FiAlertTriangle,
    FiPhone,
    FiClock,
    FiExternalLink,
    FiEdit3,
    FiLink,
    FiInfo,
} from 'react-icons/fi'
import { updateSiteSettings, getSiteSettings } from '@/lib/api/site-settings'
import { revalidateMenu } from '@/lib/api/revalidate'
import { useToast } from '@/components/toast-container'
import { siteSettingsSchema, type SiteSettingsFormData } from './validation'
import { InputField } from '@/components/input-field'

export const ContactsForm = () => {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState('')
    const [serverSuccess, setServerSuccess] = useState('')
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SiteSettingsFormData>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: {
            address: '',
            addressLink: '',
            addressNote: '',
            phone: '',
            phoneLink: '',
            workHours: '',
            workHoursNote: '',
        }
    })

    useEffect(() => {
        (async () => {
            try {
                const res = await getSiteSettings()
                if (res.success && res.data) {
                    reset(res.data)
                }
            } catch (e) {
                console.error('Failed to fetch site settings:', e)
            } finally {
                setLoading(false)
            }
        })()
    }, [reset])

    const onSubmit = (values: SiteSettingsFormData) => {
        setServerError('')
        setServerSuccess('')

        startTransition(async () => {
            try {
                // Remove tel: prefix and whitespace before sending to server
                const formattedValues = {
                    ...values,
                    phoneLink: values.phoneLink.replace(/^tel:/, '').replace(/\s+/g, '')
                }

                const res = await updateSiteSettings(formattedValues)
                if (res.success) {
                    setServerSuccess(res.message ?? 'Контакты обновлены')
                    toast.showSuccess(res.message ?? 'Контакты обновлены')
                    await revalidateMenu()
                } else {
                    setServerError(res.message ?? 'Ошибка при обновлении')
                    toast.showError(res.message ?? 'Ошибка при обновлении')
                }
            } catch (e) {
                const message = (e as { message?: string })?.message ?? 'Ошибка при обновлении'
                setServerError(message)
                toast.showError(message)
            }
        })
    }

    if (loading) {
        return (
            <Center py={10}>
                <VStack gap={4}>
                    <Spinner size="xl" color="gray.500" />
                    <Text color="gray.400">Загрузка данных...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <Box>
            <Flex align="center" gap={4} mb={10}>
                <Box 
                    bg="whiteAlpha.100" 
                    p={3.5} 
                    rounded="2xl" 
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    shadow="inner"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <FiMapPin size={24} color="white" />
                </Box>
                <VStack align="start" gap={0}>
                    <Text fontSize="2xl" color="white" fontWeight="extrabold" letterSpacing="tight">
                        Контактные данные
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        Эта информация отображается на главной странице и в футере
                    </Text>
                </VStack>
            </Flex>

            <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={10} align="stretch">
                    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
                        {/* Address Section */}
                        <Box
                            bg="whiteAlpha.50"
                            p={8}
                            borderRadius="3xl"
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                            shadow="sm"
                            _hover={{ borderColor: 'whiteAlpha.200' }}
                            transition="all 0.2s ease"
                        >
                            <Flex align="center" gap={3} mb={6}>
                                <Icon as={FiMapPin} color="whiteAlpha.600" boxSize={5} />
                                <Text fontWeight="extrabold" color="white" fontSize="xl" letterSpacing="tight">Адрес</Text>
                            </Flex>
                            <VStack gap={6} align="stretch">
                                <Box>
                                    <Text mb={2} color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Адрес заведения</Text>
                                    <InputField
                                        icon={<FiMapPin />}
                                        placeholder="ул. Примерная, 10"
                                        register={register('address')}
                                        error={errors.address}
                                    />
                                </Box>
                                <Box>
                                    <Text mb={2} color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Ссылка на карты</Text>
                                    <InputField
                                        icon={<FiExternalLink />}
                                        placeholder="https://yandex.ru/maps/..."
                                        register={register('addressLink')}
                                        error={errors.addressLink}
                                    />
                                </Box>
                                <Box>
                                    <Text mb={2} color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Примечание</Text>
                                    <InputField
                                        icon={<FiEdit3 />}
                                        placeholder="Вход с торца"
                                        register={register('addressNote')}
                                        error={errors.addressNote}
                                    />
                                </Box>
                            </VStack>
                        </Box>

                        <VStack gap={8} align="stretch">
                            {/* Contact Section */}
                            <Box
                                bg="whiteAlpha.50"
                                p={8}
                                borderRadius="3xl"
                                border="1px solid"
                                borderColor="whiteAlpha.100"
                                shadow="sm"
                                _hover={{ borderColor: 'whiteAlpha.200' }}
                                transition="all 0.2s ease"
                            >
                                <Flex align="center" gap={3} mb={6}>
                                    <Icon as={FiPhone} color="whiteAlpha.600" boxSize={5} />
                                    <Text fontWeight="extrabold" color="white" fontSize="xl" letterSpacing="tight">Связь</Text>
                                </Flex>
                                <VStack gap={6} align="stretch">
                                    <Box>
                                        <Text mb={2} color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Телефон (текст)</Text>
                                        <InputField
                                            icon={<FiPhone />}
                                            placeholder="+7 (999) 000-00-00"
                                            register={register('phone')}
                                            error={errors.phone}
                                        />
                                    </Box>
                                    <Box>
                                        <Text mb={2} color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Номер для звонка</Text>
                                        <InputField
                                            icon={<FiLink />}
                                            placeholder="+79990000000"
                                            register={register('phoneLink')}
                                            error={errors.phoneLink}
                                        />
                                    </Box>
                                </VStack>
                            </Box>

                            {/* Work Hours Section */}
                            <Box
                                bg="whiteAlpha.50"
                                p={8}
                                borderRadius="3xl"
                                border="1px solid"
                                borderColor="whiteAlpha.100"
                                shadow="sm"
                                _hover={{ borderColor: 'whiteAlpha.200' }}
                                transition="all 0.2s ease"
                            >
                                <Flex align="center" gap={3} mb={6}>
                                    <Icon as={FiClock} color="whiteAlpha.600" boxSize={5} />
                                    <Text fontWeight="extrabold" color="white" fontSize="xl" letterSpacing="tight">График работы</Text>
                                </Flex>
                                <VStack gap={6} align="stretch">
                                    <Box>
                                        <Text mb={2} color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Время работы</Text>
                                        <InputField
                                            icon={<FiClock />}
                                            placeholder="Пн-Вс: 10:00 - 22:00"
                                            register={register('workHours')}
                                            error={errors.workHours}
                                        />
                                    </Box>
                                    <Box>
                                        <Text mb={2} color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Примечание</Text>
                                        <InputField
                                            icon={<FiInfo />}
                                            placeholder="Без перерывов и выходных"
                                            register={register('workHoursNote')}
                                            error={errors.workHoursNote}
                                        />
                                    </Box>
                                </VStack>
                            </Box>
                        </VStack>
                    </SimpleGrid>

                    {serverError && (
                        <Alert.Root status="error" borderRadius="xl" bg="red.950/30" border="1px solid" borderColor="red.900/50">
                            <Alert.Indicator color="red.400">
                                <FiAlertTriangle />
                            </Alert.Indicator>
                            <Alert.Content>
                                <Alert.Title color="red.200" fontWeight="bold">Ошибка</Alert.Title>
                                <Alert.Description color="red.300/80">{serverError}</Alert.Description>
                            </Alert.Content>
                        </Alert.Root>
                    )}

                    {serverSuccess && (
                        <Alert.Root status="success" borderRadius="xl" bg="green.950/30" border="1px solid" borderColor="green.900/50">
                            <Alert.Indicator color="green.400">
                                <FiCheckCircle />
                            </Alert.Indicator>
                            <Alert.Content>
                                <Alert.Title color="green.200" fontWeight="bold">Успех</Alert.Title>
                                <Alert.Description color="green.300/80">{serverSuccess}</Alert.Description>
                            </Alert.Content>
                        </Alert.Root>
                    )}

                    <Flex justify="flex-end">
                        <Button
                            size="lg"
                            type="submit"
                            loading={isPending}
                            disabled={loading}
                            loadingText="Сохранение..."
                            bg="white"
                            color="gray.950"
                            px={12}
                            _hover={{ 
                                bg: 'gray.100', 
                                shadow: '0 0 30px rgba(255,255,255,0.2)',
                                transform: 'translateY(-1px)'
                            }}
                            _active={{ transform: 'scale(0.98)' }}
                            borderRadius="2xl"
                            fontWeight="bold"
                            transition="all 0.2s ease"
                        >
                            Сохранить изменения
                        </Button>
                    </Flex>
                </VStack>
            </form>
        </Box>
    )
}
