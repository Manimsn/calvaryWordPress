  
-- =============================================  
-- Author:  Bounteous  
-- Create date: 08-26-2025  
-- Description: Update a temprary passwrod  
-- =============================================  
CREATE PROCEDURE [dbo].[api_ccfl_ma_update_temprary_password]  
 @Password nvarchar(50),  
 @User_ID int,  
 @DomainID int  
AS  
BEGIN  
 SET NOCOUNT ON;  
    DECLARE @AuditUserName NVARCHAR(254) = N'UpdatePassword';  
 DECLARE @AuditOnBehalfOfUserName NVARCHAR(254) = NULL;  
    DECLARE @AuditOnBehalfOfUserID INT = NULL;  
  
 SELECT @AuditOnBehalfOfUserName = Display_Name, @AuditOnBehalfOfUserID = User_ID  
    FROM dp_Users  
    WHERE User_ID = @User_ID;  
  
    DECLARE @ToBeAudited mp_ServiceAuditLog_ccfl;  
  
 DECLARE @PasswordBinary varbinary(16) = (SELECT CONVERT(VARBINARY(16), @Password, 1));  
  
 UPDATE [dbo].[dp_Users]  
    SET Password = @PasswordBinary  
    WHERE User_ID = @User_ID AND Domain_ID = @DomainID  
  
    INSERT INTO @ToBeAudited  
 SELECT 'dp_Users', @User_ID, 'Updated', @User_ID, @AuditUserName,   
    'Password', NULL, '...', '...', NULL, NULL,   
       @AuditOnBehalfOfUserID, @AuditOnBehalfOfUserName;  
  
 -- Execute audit logging  
    IF EXISTS (SELECT 1 FROM @ToBeAudited)  
    BEGIN  
        EXEC dbo.util_CreateAuditLogEntries_ccfl @ToBeAudited;  
    END;  
  
 SELECT 'Success' as Message;  
  
END  