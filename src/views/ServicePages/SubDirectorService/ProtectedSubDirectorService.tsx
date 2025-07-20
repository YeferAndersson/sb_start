import ProtectedServiceWrapper from '../ProtectedServiceWrapper'
import SubDirectorService from './SubDirectorService'

const ProtectedSubDirectorService = () => {
    return (
        <ProtectedServiceWrapper
            serviceId={6}
            ServiceComponent={SubDirectorService}
        />
    )
}

export default ProtectedSubDirectorService