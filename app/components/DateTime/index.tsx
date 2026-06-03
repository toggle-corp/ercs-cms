import { ListView } from '@ifrc-go/ui';

interface DateTimeProps {
    dateString: string | undefined | null;
}

function DateTime({ dateString }: DateTimeProps) {
    const date = dateString ? new Date(dateString) : null;
    if (!date || Number.isNaN(date.getTime())) {
        return (
            <ListView layout="block">
                -
            </ListView>
        );
    }

    const timeFormatted = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    const dateFormatted = date.toLocaleDateString('en-CA');

    return (
        <ListView layout="block">
            <div>{timeFormatted}</div>
            <div>{dateFormatted}</div>
        </ListView>
    );
}

export type { DateTimeProps };
export default DateTime;
