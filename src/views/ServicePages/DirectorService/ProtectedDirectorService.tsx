import ProtectedServiceWrapper from '../ProtectedServiceWrapper'
import DirectorService from './DirectorService'

const ProtectedDirectorService = () => {
    return (
        <ProtectedServiceWrapper
            serviceId={5}
            ServiceComponent={DirectorService}
        />
    )
}

export default ProtectedDirectorService