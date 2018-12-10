package fi.fta.utils;

import java.io.IOException;

import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

public class AttachmentsUtils
{
	
	public static ResponseEntity<?> prepareResponseEntity(Object value, String contentType)
	{
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.setContentType(formatMediaType(contentType));
		return new ResponseEntity<>(value, responseHeaders, HttpStatus.OK);
	}
	
	public static ResponseEntity<?> prepareResponseEntityAsAttachment(
		byte[] content, String name, String contentType)
	{
	    HttpHeaders responseHeaders = new HttpHeaders();
	    responseHeaders.setContentType(formatMediaType(contentType));
	    responseHeaders.set("Content-Disposition", "attachment; filename=\"" + name + "\"");
	    return new ResponseEntity<>(content, responseHeaders, HttpStatus.OK);
	}
	
	public static ResponseEntity<?> prepareExcelResponse(Workbook workbook, String name) throws IOException
	{
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		try
		{
			workbook.write(os);
			return AttachmentsUtils.prepareResponseEntityAsAttachment(
				os.toByteArray(), name, MimeFormat.XLXS.getType());
		}
		finally
		{
			os.close();
		}
	}
	
	public static ResponseEntity<?> prepareEmptyHtmlResponse()
	{
		return AttachmentsUtils.prepareResponseEntity("", MimeFormat.HTML.getType());
	}
	
	private static MediaType formatMediaType(String contentType)
	{
		return MediaType.parseMediaType(contentType+";charset="+Encoding.DEFAULT_ENCODING);	
	}
	
}
