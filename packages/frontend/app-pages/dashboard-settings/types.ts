export type SerializedUser = {
    _id: string
    username: string
    name: string
    surname?: string
    patronymic?: string
    role: string
    isActive: boolean
}

export type UserRowProps = {
    user: SerializedUser
    isOwnAccount: boolean
}
