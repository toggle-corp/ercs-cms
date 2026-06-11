import { useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';

import {
    AdminAreaLevel,
    useAdminAreasQuery,
} from '#generated/types/graphql';

export default function useRegionMap() {
    const [{ data }] = useAdminAreasQuery({
        variables: {
            filters: {
                level: AdminAreaLevel.Region,
            },
        },
    });

    return useMemo(() => (
        listToMap(
            data?.adminAreas?.results,
            (region) => region.id,
            (region) => region.name,
        ) ?? {}
    ), [data]);
}
