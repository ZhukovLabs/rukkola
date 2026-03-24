export type SerializedUser = {
    _id: string
    username: string
    name: string
    surname?: string
    patronymic?: string
    role: string
}

export type UserRowProps = {
    onUserDelete: (id: string) => void
    onUserUpdate: (user: SerializedUser) => void
    user: SerializedUser
    isOwnAccount: boolean
}
