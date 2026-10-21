import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../actions/authActions"

export const useAuth = () => {
    const dispatch = useDispatch()
    const auth = useSelector((state) => state.auth)

    return {
        ...auth,
        logout: () => dispatch(logoutUser())
    }
}
