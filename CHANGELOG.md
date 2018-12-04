# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2018-12-04
### Changed 
- Start using coam-client  

## [1.0.2] - 2018-12-04
### Fixed 
- Fix to canonically handle members after adding a new one to the group.  

## [1.0.1] - 2018-10-29
### Fixed
- Fix adding client ids

## [1.0.0] - 2018-10-29
### Changed
- `groupId` property is now replaced with `groupUrl` to allow better integration with REST-aware services

## [0.5.0] - 2018-10-29
### Fixed
- Tweaked icons size ('lg' instead of '2x'), removed custom sizing to improve consistency

## [0.4.0] - 2018-10-29
### Added
- Added additional properties to further customize the user experience by showing user emails and names.

## [0.3.0] - 2018-10-26
### Changed
- Using canonical user principal.

## [0.2.3]
### Changed
- Added information about Auth0 connection when showing user information

## [0.2.1]
### Fixed
- Fixed a bug causing incorrect behavior with client accounts
- Added missing translation keys

## [0.2.0]
### Removed
- Removed the support for group information
 
### Added
- A new, clearer look and feel
- Better error handling

## [0.1.2]
### Added
- Added development guide and storybook integration
- Added new story for UsersTable in a Drawer
- Support mutually exclusive roles. In case set, only 1 role would be allowed to be assigned.
### Fixed
- Fixed issues when running Storybook locally
- Fixed issues preventing correct render when props are being updated

## [0.1.1] - 2018-08-14
### Fixed
- Fix issue when table was not updated when groupId property changed
### Added
- Added new icons for users
- Added more information for corner cases (no user)

## [0.1.0] - 2018-08-14
### Fixed
- Removed modal box and replaced with inline editing

## [0.0.2] - 2018-08-14
### Added
- Initial version that contains UsersTable 
