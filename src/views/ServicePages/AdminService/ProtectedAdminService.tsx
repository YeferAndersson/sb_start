import ProtectedServiceWrapper from '../ProtectedServiceWrapper'
import AdminService from './AdminService'

const ProtectedAdminService = () => {
    return (
        <ProtectedServiceWrapper
            serviceId={4}
            ServiceComponent={AdminService}
        />
    )
}

export default ProtectedAdminService