import ProtectedServiceWrapper from '../ProtectedServiceWrapper'
import TesistaService from './TesistaService'

const ProtectedTesistaService = () => {
    return (
        <ProtectedServiceWrapper
            serviceId={1}
            ServiceComponent={TesistaService}
        />
    )
}

export default ProtectedTesistaService