import { useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';

import { useAdminAreasQuery } from '#generated/types/graphql';
import type {
    REGION_LEVEL,
    WOREDA_LEVEL,
    ZONE_LEVEL,
} from '#utils/common';

export default function useRegionMap(
    level: REGION_LEVEL | ZONE_LEVEL | WOREDA_LEVEL,
) {
    const [{ data }] = useAdminAreasQuery({
        variables: {
            filters: {
                level,
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
