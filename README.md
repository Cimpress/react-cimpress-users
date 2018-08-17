# react-cimpress-users
Thin React component to help managing Cimpress user access

## Overview 
The purpose of this package is to provide simple **and** embedded COAM Authorization management
for React (or Vue) applications.
 
The **UsersTable** component provides the ability to add, edit or remove users within a single COAM group.

To simplify even more the access management, the component requires a list of roles that should 
be considered. Other existing roles will neither be shown nor managed to avoid possible conflicts. 

The component was designed to fit in a Drawer, but can also be used inline (within a page) to get better experience.


## Usage

Install the package:
    
    npm install --save react-cimpress-users

  
Add to your code

     <UsersTable
          accessToken={this.props.accessToken}
          groupId={this.props.groupId}
          allowedRoles={[{
            roleName: 'Template Editor',
            roleCaption: 'Editor',
            isManagerRole: true
          }, {
            roleName: 'Template Reader',
            roleCaption: 'Reader',
            isManagerRole: false
          }]}
        />
        
The component requires:
- **accessToken** - to make sure it can communicate with COAM
- **groupId** - the identifier of the group that will be managed
- **allowedRoles** - a list of roles definition that should be managed by the component. 
The idea behind this list is to provide very targeted experience suitable only for the 
application where the component is integrated with. In majority of cases, users need to have
only a few roles assigned to be able to use the application. Each role has **roleName** (required) that 
will be used to pass to COAM, **roleCaption** (optional) that would be used within the UI and 
**isManagerRole** (optional) that will be used to color the role differently.

## Development

1. Clone the repository
    
        git clone https://github.com/Cimpress/react-cimpress-users
        
2. Ensure you have the following environment variables set. These are used to get Auth0 token to be able to 
download the translations files in the next step.
    
        export CLIENT_ID=<...>
        export CLIENT_SECRET=<...>
        
3. Run the following command to download the language translations files. 
        
        npm run build

4. For developing, we use [Storybook](https://github.com/storybooks/storybook). You can run and see
the stories with:
        
        npm run storybook
        
5. Make sure your code passes the linting rules
        
        npm run code-check
        
6. Make sure to update **package.json** with the new version of the package (please follow 
[semantic versioning](https://semver.org/). After, please also update **CHANGELOG.md** file 
with short info for the changes in this new version.   

7. Don't forget to enjoy!