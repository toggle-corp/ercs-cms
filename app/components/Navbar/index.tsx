import {
    Heading,
    Image,
    ListView,
    PageContainer,
} from '@ifrc-go/ui';

import Link from '#components/Link';
import Logo from '#resources/image/logo.png';

import styles from './styles.module.css';

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <PageContainer
                className={styles.top}
                contentClassName={styles.topContent}
            >
                <ListView
                    withSpaceBetweenContents
                >
                    <Link
                        to="home"
                    >
                        <ListView spacing="sm">
                            <Image
                                src={Logo}
                                className={styles.icon}
                                withoutBackground
                            />
                            <Heading
                                level={4}
                            >
                                ERCS EOC
                            </Heading>
                        </ListView>
                    </Link>
                </ListView>
            </PageContainer>
        </nav>
    );
}

export default Navbar;
