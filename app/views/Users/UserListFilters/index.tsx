import { useState } from 'react';
import {
    Button,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import RegionSearchMultiSelectInput, { type AdminAreaItem } from '#components/RegionSearchMultiSelectInput';
import { AdminAreaLevel } from '#generated/types/graphql';
import useGlobalEnums from '#hooks/useGlobalEnums';
import {
    keySelector,
    labelSelector,
    statusFilterOptions,
    valueSelector,
} from '#utils/common';

import type { UsersFilterType } from '../index';

export interface Props {
    value: UsersFilterType;
    onChange: (...args: EntriesAsList<UsersFilterType>) => void;
    filtered: boolean;
    onReset: () => void;
}

function UserFilter({
    value, onChange, filtered, onReset,
}: Props) {
    const [regionOptions, setRegionOptions] = useState<
        AdminAreaItem[] | undefined | null
    >([]);

    const { userRole: roleOptions } = useGlobalEnums();

    return (
        <>
            <RegionSearchMultiSelectInput
                name="regions"
                placeholder="Region"
                level={AdminAreaLevel.Region}
                value={value.regions}
                onOptionsChange={setRegionOptions}
                options={regionOptions}
                onChange={onChange}
            />
            <SelectInput
                name="role"
                placeholder="Role"
                value={value.role}
                onChange={onChange}
                options={roleOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
            />
            <SelectInput
                name="isActive"
                placeholder="Status"
                value={value.isActive}
                onChange={onChange}
                options={statusFilterOptions}
                keySelector={valueSelector}
                labelSelector={labelSelector}
            />
            <TextInput
                name="search"
                placeholder="Search by name or email"
                value={value.search}
                onChange={onChange}
            />
            <Button
                name={undefined}
                onClick={onReset}
                title="Reset"
                disabled={!filtered}
            >
                Reset
            </Button>
        </>
    );
}

export default UserFilter;
