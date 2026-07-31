import { gql } from 'urql';

// eslint-disable-next-line import/prefer-default-export
export const GLOBAL_ENUMS = gql`
    query GlobalEnums {
        enums {
            LinkType {
                key
                label
            }
            ReportType {
                key
                label
            }
            UserRole {
                key
                label
            }
            TeamMemberSex {
                key
                label
            }
            DashboardPage {
                key
                label
            }
            ReportContentType {
                key
                label
            }
            ReportVisibility {
                key
                label
            }
        }
    }
`;
