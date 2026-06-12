import { useMemo } from 'react';
import { SelectInput } from '@ifrc-go/ui';

import {
    AdminAreaLevel,
    useAdminAreasQuery,
} from '#generated/types/graphql';
import {
    idSelector,
    nameSelector,
    type REGION_LEVEL,
    type WOREDA_LEVEL,
    type ZONE_LEVEL,
} from '#utils/common';

export interface Props<NAME extends string | undefined> {
    className?: string;
    name: NAME;
    value: string | undefined | null;
    onChange: (value: string | undefined, name: NAME) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    level: REGION_LEVEL | ZONE_LEVEL | WOREDA_LEVEL;
}

function RegionSelectInput<NAME extends string | undefined>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        placeholder,
        error,
        disabled,
        level = AdminAreaLevel.Region,
    } = props;

    const [{ data: adminAreasData }] = useAdminAreasQuery({
        variables: {
            filters: {
                level,
            },
        },
    });

    const regionOptions = useMemo(() => (
        adminAreasData?.adminAreas?.results ?? []
    ), [adminAreasData?.adminAreas?.results]);

    return (
        <SelectInput
            className={className}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            options={regionOptions}
            keySelector={idSelector}
            labelSelector={nameSelector}
            nonClearable={false}
            error={error}
            disabled={disabled}
        />
    );
}

export default RegionSelectInput;
