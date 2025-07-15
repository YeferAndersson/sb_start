import ProtectedServiceWrapper from '../ProtectedServiceWrapper'
import CoordinadorService from './CoordinadorService'

const ProtectedCoordinadorService = () => {
    return (
        <ProtectedServiceWrapper
            serviceId={3}
            ServiceComponent={CoordinadorService}
        />
    )
}

export default ProtectedCoordinadorService