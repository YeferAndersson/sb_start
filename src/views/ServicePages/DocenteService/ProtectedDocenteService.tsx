import ProtectedServiceWrapper from '../ProtectedServiceWrapper'
import DocenteService from './DocenteService'

const ProtectedDocenteService = () => {
    return (
        <ProtectedServiceWrapper
            serviceId={2}
            ServiceComponent={DocenteService}
        />
    )
}

export default ProtectedDocenteService