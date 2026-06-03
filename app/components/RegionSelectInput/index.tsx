import { useMemo } from 'react';
import { SelectInput } from '@ifrc-go/ui';

import {
    AdminAreaLevel,
    useAdminAreasQuery,
} from '#generated/types/graphql';
import {
    idSelector,
    nameSelector,
} from '#utils/common';

export interface Props<NAME extends string | undefined> {
    className?: string;
    name: NAME;
    value: string | undefined | null;
    onChange: (value: string | undefined, name: NAME) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

function RegionSelectInput<NAME extends string | undefined>({
    className,
    name,
    value,
    onChange,
    placeholder,
    error,
    disabled,
}: Props<NAME>) {
    const [{ data: adminAreasData }] = useAdminAreasQuery({
        variables: {
            filters: {
                level: AdminAreaLevel.Region,
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
