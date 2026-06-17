import { TextInput } from '@ifrc-go/ui';
import type { EntriesAsList } from '@togglecorp/toggle-form';

import { type TeamMemberFilter } from '#generated/types/graphql';

interface Props {
    value: TeamMemberFilter
    onChange: (...args: EntriesAsList<TeamMemberFilter>) => void;
}

function TeamMembersFilters(props: Props) {
    const { value, onChange } = props;

    return (
        <>
            {/*
                NOTE: we might have to create MultiSelectInput for region
                and woredas input
                <RegionSelectInput
                    name="woredas"
                    level={AdminAreaLevel.Woreda}
                    value={value.woredas}
                    onChange={onChange}
                />
                <RegionSelectInput
                    name="regions"
                    level={AdminAreaLevel.Region}
                    value={value.regions}
                    onChange={onChange}
                />
            */}
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
