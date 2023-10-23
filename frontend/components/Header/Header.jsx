import { Flex } from "@chakra-ui/react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
    return (
        <Flex
        height='15vh'
            p="2rem"
            justifyContent="space-between"
            alignItems="end"
        >
            <ConnectButton />
        </Flex>
    )
}

export default Header;