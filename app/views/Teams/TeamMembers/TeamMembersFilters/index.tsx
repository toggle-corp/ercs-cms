import { useState } from 'react';
import { TextInput } from '@ifrc-go/ui';
import type { EntriesAsList } from '@togglecorp/toggle-form';

import RegionSearchMultiSelectInput, { type AdminAreaItem } from '#components/RegionSearchMultiSelectInput';
import {
    AdminAreaLevel,
    type TeamMemberFilter,
} from '#generated/types/graphql';

interface Props {
    value: TeamMemberFilter
    onChange: (...args: EntriesAsList<TeamMemberFilter>) => void;
}

function TeamMembersFilters(props: Props) {
    const { value, onChange } = props;

    const [teamMemberOptions, setTeamMemberOptions] = useState<
        AdminAreaItem[] | undefined | null
    >([]);

    return (
        <>
            <RegionSearchMultiSelectInput
                name="woredas"
                placeholder="Woredas"
                level={AdminAreaLevel.Woreda}
                value={value.woredas}
                onOptionsChange={setTeamMemberOptions}
                options={teamMemberOptions}
                onChange={onChange}
            />
            <RegionSearchMultiSelectInput
                name="regions"
                placeholder="Regions"
                level={AdminAreaLevel.Region}
                value={value.regions}
                onOptionsChange={setTeamMemberOptions}
                options={teamMemberOptions}
                onChange={onChange}
            />
            <TextInput
                name="search"
                placeholder="Search"
                value={value.search}
                onChange={onChange}
            />
        </>
    );
}

export default TeamMembersFilters;
