import React, { useEffect, useState } from "react";
import { backendAPI } from "../services/backendService";
import type { PageState } from "../models/PageState";
import type { UserResponse } from "../models/User";
import { useNavigate } from "react-router";


// TODO: add email, username and password validation here
export default function RegisterForm() {
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pageState, setPageState] = useState<PageState<UserResponse>>({});
  const navigate = useNavigate()


  let params = new URLSearchParams(document.location.search)
  const email = params.get("email")
  const token = params.get("token");

  useEffect(() => {
    if (!token || !email) {
      navigate("/404")
    }
  }, [])

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (pageState.isLoading !) return
    if (pwd !== confirmPwd) {
      return setPageState({errMsg: "As senhas não correspondem"})
    }
    setPageState({isLoading: true})
    //@ts-ignore
    const res = await backendAPI.resetPassword(pwd, token as string)
    if (res.errMsg) {
      setPageState(res)
    } else {
      // TODO: use a mui notification toast here
      // setNotification(RESET_PWD_SUCCESS)
      navigate("/auth/login")
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>Seu e-mail: {email}</div>
        <div>
          <label htmlFor="password">Senha</label>
          <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              value={pwd}
              required
          />
        </div>
        <div>
          <label htmlFor="password">Confirmar Senha</label>
          <input
              type="password"
              id="password"
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
              value={confirmPwd}
              required
          />
        </div>
        <button type="submit" disabled={pageState.isLoading}>
          Redefinir Senha
        </button>
      </form>
      {pageState.isLoading && <div>Carregando...</div>}
      {pageState.errMsg && <div>{pageState.errMsg}</div>}
    </>
  );
}
