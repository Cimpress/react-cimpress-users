# react-cimpress-users
Thin React component to help managing Cimpress user access
 
###  What
I would like to manage the access to my application inside the application itself. 
I still want to benefit managing permissions with COAM.

###  How

**UsersTable** - is a simple react component that provides you the ability to add, edit or 
remove users within a single COAM group.

Since it's a thin component, it was designed to fit in a Drawer, but can also be used inline
to get better experience.

##### How to use it

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
- accessToken - to make sure it can communicate with COAM
- groupId - the identifier of the group that will be managed
- allowedRoles - a list of roles definition that should be managed by the component. 
The idea behind this list is to provide very targeted experience suitable only for the 
application where the component is integrated with. In majority of cases, users need to have
only a few roles assigned to be able to use the application. Each role has **roleName** (required) that 
will be used to pass to COAM, **roleCaption** (optional) that would be used within the UI and 
**isManagerRole** (optional) that will be used to color the role differently.
