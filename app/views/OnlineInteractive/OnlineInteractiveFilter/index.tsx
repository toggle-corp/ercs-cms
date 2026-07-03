import { TextInput } from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type OnlineInteractiveFilterType } from '../index';

export interface Props {
    value: OnlineInteractiveFilterType;
    onChange: (...args: EntriesAsList<OnlineInteractiveFilterType>) => void;
}

function OnlineInteractiveFilter({ value, onChange }: Props) {
    return (
        <TextInput
            name="search"
            placeholder="Search by title"
            value={value.search}
            onChange={onChange}
        />
    );
}

export default OnlineInteractiveFilter;
