import { useContext } from 'react';

import GlobalEnumsContext from '#contexts/GlobalEnumsContext';

export default function useGlobalEnums() {
    return useContext(GlobalEnumsContext);
}
