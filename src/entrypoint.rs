use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey,
};
use crate::processor::Processor;
entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let a =Processor::process(program_id, accounts, instruction_data);
    
    Ok(())
}

//H32fjEuV4J2r5SVB43gvTYWp2Ee6PQvNiD8qPPSyFaTr

//EjHVoGYsCNJf4h4RQSSMGwUpryQauNUfLr5zMEJTgxBf