import React from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { BackendGateway } from "io/BackendGateway";
import { action } from "mobx";

interface IProps {
  children: any;
}

export const UserDataContext = React.createContext({
  name: null,
  setName: (name: string) => {},
});

export const UserDataContextProvider = observer((props: IProps) => {
  const localStore = useLocalObservable(() => ({
    name: null,
  }));

  const setName = action((name: string) => {
    localStore.name = name;
  });

  React.useEffect(() => {
    BackendGateway.GetName()
      .then((name) => {
        if (name) {
          setName(name);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <UserDataContext.Provider
      value={{
        name: localStore.name,
        setName: (name: string) => {
          if (name) {
            BackendGateway.SetName(name).then(() => {
              setName(name);
            });
          }
        },
      }}
    >
      {props.children}
    </UserDataContext.Provider>
  );
});
