export default function ({store, route, redirect}) {
  if (route.query !== undefined) {
    if (route.query.id !== undefined) {
      redirect('/my-loads/active/' + route.query.id + '/')
    }
  }
}

