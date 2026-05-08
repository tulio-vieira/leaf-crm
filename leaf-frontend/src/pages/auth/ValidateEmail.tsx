import { backendAPI } from "../../services/backendService";
import Header from "../../components/Header";
import type { PageState } from "../../models/PageState";
import type { UserResponse } from "../../models/User";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";


const ValidateEmailPage = () => {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState<UserResponse>>({isLoading: true});

  useEffect(() => {
    const token = new URLSearchParams(document.location.search).get("token");
    if (!token) {
      navigate("/404");
      return;
    }
    backendAPI.validateEmail(token as string)
    .then(res => {
      setPageState(res)
    })
  }, [])


  return (
    <main>
      <Header />
      <h1>Validar E-mail</h1>
      {pageState.isLoading && <div>Carregando...</div>}
      {pageState.errMsg && <div>{pageState.errMsg}</div>}
      {pageState.data &&
        <>
          <div>Seu e-mail: {pageState.data.email}</div>
          <div>foi validado com sucesso!</div>
          <div><Link to="/auth/login">Login</Link> na sua conta</div>
        </>
      }
    </main>
  )
}

export default ValidateEmailPage
