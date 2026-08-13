import {
    Button,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type OnlineInteractiveFilterType } from '../index';

export interface Props {
    value: OnlineInteractiveFilterType;
    onChange: (...args: EntriesAsList<OnlineInteractiveFilterType>) => void;
    filtered: boolean;
    onReset: () => void;
}

function OnlineInteractiveFilter({
    value,
    onChange,
    filtered,
    onReset,
}: Props) {
    return (
        <>
            <TextInput
                name="search"
                placeholder="Search by title"
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

export default OnlineInteractiveFilter;
