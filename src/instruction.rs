use crate::error::TokenError;
use solana_program::{
    program_error::ProgramError,
   msg
};
#[derive(Clone, Debug, PartialEq)]
pub enum TokenInstruction{
    InitializeMint,
    InitializeAccount,
    MintTo{
        amount:u64
    },
    InitializeMetadataAccount,
  
}
impl TokenInstruction {
    pub fn unpack(input:&[u8]) -> Result<Self,ProgramError>{
    use TokenError::InvalidInstruction;
        msg!("======Token Instruction=======");
        let (&tag, rest) = input.split_first().ok_or(InvalidInstruction)?;
        msg!("{:?}",tag);
        Ok(match tag {
            0 =>  {
                
                Self::InitializeMint   
            }
            1=> {
                Self::InitializeAccount
            }
            2=> {
                msg!("rest {:?}",rest);
                let amount = rest
                    .get(..8)
                    .and_then(|slice| slice.try_into().ok())
                    .map(u64::from_le_bytes)
                    .ok_or(InvalidInstruction)?;
                    msg!("amount {:?}",amount);
                Self::MintTo{amount}
            }
            3=> {
                Self::InitializeMetadataAccount
               
            }
            _=> return Err(TokenError::InvalidInstruction.into()),
        })

    }
} 