import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router"
import RootLayout from "./layouts/root.layout"
import NotFound from "./pages/404"
import Home from "./pages"
import ErrorScreen from "./components/utilities/error";
import { GlobalProvider } from "./constants/providers/global.provider";
import Posts from "./pages/post";
import { PostsProvider } from "./constants/providers/posts.provider";
import { CategoriesProvider } from "./constants/providers/categories.provider";
import { ThemeProvider } from "@mui/material";
import { theme } from "./constants/variables/global.vars";
import CreatePost from "./pages/post.create";
import Logout from "./pages/logout";
import { UserProvider } from "./constants/providers/user.provider";


const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />} errorElement={<ErrorScreen />}  >
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />

        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/create" element={<CreatePost />} />
        <Route path="/logout" element={<Logout />} />

      </Route>
    )
  )

  return (
    <ThemeProvider theme={theme}>
      <GlobalProvider>
        <PostsProvider>
          <CategoriesProvider>
            <UserProvider>
              <RouterProvider router={router} />
            </UserProvider>
          </CategoriesProvider>
        </PostsProvider>
      </GlobalProvider>
    </ThemeProvider>
  )
}

export default App;