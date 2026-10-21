const toSafeUser = (user) => {
    const output = user.toObject()

    delete output.password

    return output
}

module.exports = {
    toSafeUser
}
