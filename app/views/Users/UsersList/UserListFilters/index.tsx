import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import RegionSelectInput from '#components/RegionSelectInput';
import {
    AdminAreaLevel,
    useEnumsQuery,
} from '#generated/types/graphql';
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
}

function UserFilter({ value, onChange }: Props) {
    const [{ data: enumsData }] = useEnumsQuery();

    const roleOptions = enumsData?.enums?.UserRole;

    return (
        <>
            <RegionSelectInput
                name="region"
                level={AdminAreaLevel.Region}
                placeholder="Region"
                value={value.region}
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
        </>
    );
}

export default UserFilter;
