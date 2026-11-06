const schema=gql`
"""
## Example

~~~json
{"name":"Ada","age":30}
~~~

~~~javascript
const value={name:"Ada"};console.log(value)
~~~
"""
type User{name:String age:Int}
`;
