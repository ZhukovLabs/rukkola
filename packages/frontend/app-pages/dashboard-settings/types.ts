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
    onUserDelete: (id: string) => void
    onUserUpdate: (user: SerializedUser) => void
    user: SerializedUser
    isOwnAccount: boolean
}
