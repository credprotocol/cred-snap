import {useContext} from 'react';
import styled from 'styled-components';
import {MetamaskActions, MetaMaskContext} from '../hooks';
import {
  connectSnap,
  getSnap,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';

enum TransactionConstants {
  // The address of an arbitrary contract that will reject any transactions it receives
  Address = '0x08A8fDBddc160A7d5b957256b903dCAb1aE512C5',
  // Some example encoded contract transaction data
  UpdateWithdrawalAccount = '0x83ade3dc00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000047170ceae335a9db7e96b72de630389669b334710000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
  UpdateMigrationMode = '0x2e26065e0000000000000000000000000000000000000000000000000000000000000000',
  UpdateCap = '0x85b2c14a00000000000000000000000047170ceae335a9db7e96b72de630389669b334710000000000000000000000000000000000000000000000000de0b6b3a7640000',
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;

  ${({theme}) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({theme}) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;

  ${({theme}) => theme.mediaQueries.small} {
    font-size: ${({theme}) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({theme}) => theme.colors.background.alternative};
  border: 1px solid ${({theme}) => theme.colors.border.default};
  color: ${({theme}) => theme.colors.text.alternative};
  border-radius: ${({theme}) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }

  ${({theme}) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({theme}) => theme.colors.error.muted};
  border: 1px solid ${({theme}) => theme.colors.error.default};
  color: ${({theme}) => theme.colors.error.alternative};
  border-radius: ${({theme}) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  ${({theme}) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({type: MetamaskActions.SetError, payload: e});
    }
  };

  const handleSendHelloClick = async () => {
    try {
      const [from] = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!from) {
        throw new Error('Failed to get accounts');
      }

      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: TransactionConstants.Address,
            value: '0x0',
            data: TransactionConstants.UpdateWithdrawalAccount,
          },
        ],
      });
    } catch (e) {
      console.error(e);
      dispatch({type: MetamaskActions.SetError, payload: e});
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>cred-snap</Span>
      </Heading>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton/>,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Send Test Transaction',
            description:
              'Display a transaction screen with a custom Cred Score tab showing the score of your wallet before you sign the transaction.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
