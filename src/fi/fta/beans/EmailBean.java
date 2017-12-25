package fi.fta.beans;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public class EmailBean extends IdBean implements EmailFacade
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -8417764201316517291L;
	
	@Column(unique=true, nullable=false)
	protected String email;
	
	
	public EmailBean()
	{}
	
	public EmailBean(Long id, String email)
	{
		super(id);
		this.setEmail(email);
	}
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
}
