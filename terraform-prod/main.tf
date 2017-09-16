#####################################################################
########### MAKE SURE TO CHANGE NODE TO RUN IN BACKGROUND ###########
#####################################################################

provider "aws" {
	"region" = "${var.region}"
	"access_key" = "${var.access_key}"
	"secret_key" = "${var.secret_key}"
}

resource "aws_instance" "api_server" {
	ami = "ami-026b0214"
	instance_type = "t1.micro"
	key_name = "fre"
	vpc_security_group_ids = ["${aws_security_group.api_server.id}"]

	tags {
		Name = "api_server"
	}

	provisioner "remote-exec" {
		script = "./provisioners/api_provisioner.sh"

		connection {
			user = "ubuntu"
			private_key = "${file("~/Downloads/fre.pem")}"
			type = "ssh"
		}
	}
}

resource "aws_instance" "client_server" {
	ami = "ami-026b0214"
	instance_type = "t1.micro"
	key_name = "fre"
	vpc_security_group_ids = ["${aws_security_group.api_server.id}"]

	tags {
		Name = "client_server"
	}

	provisioner "file" {
		source = "./provisioners/client_provisioner.sh"
		destination = "~/client_provisioner.sh"

		connection {
			user = "ubuntu"
			private_key = "${file("~/Downloads/fre.pem")}"
			type = "ssh"
		}
	}

	provisioner "remote-exec" {
		inline = [
			"sudo chmod +x ~/client_provisioner.sh",
			"~/client_provisioner.sh  -a ${aws_instance.api_server.public_ip}"
		]

		connection {
			user = "ubuntu"
			private_key = "${file("~/Downloads/fre.pem")}"
			type = "ssh"
		}
	}
}

resource "aws_instance" "proxy_server" {
	ami = "ami-4b133c5d"
	instance_type = "t2.micro"
	key_name = "fre"
	vpc_security_group_ids = ["${aws_security_group.api_server.id}"]

	tags {
		Name = "proxy_server"
	}

	provisioner "remote-exec" {
		script = "./provisioners/proxy_provisioner.sh"

		connection {
			user = "ubuntu"
			private_key = "${file("~/Downloads/fre.pem")}"
			type = "ssh"
		}
	}
}

resource "aws_instance" "web_server" {
	ami = "ami-4b133c5d"
	instance_type = "t2.micro"
	key_name = "fre"
	vpc_security_group_ids = ["${aws_security_group.api_server.id}"]

	tags {
		Name = "api_server"
	}

	provisioner "file" {
		source = "./provisioners/nginx_provisioner.sh"
		destination = "~/nginx_provisioner.sh"

		connection {
			user = "ubuntu"
			private_key = "${file("~/Downloads/fre.pem")}"
			type = "ssh"
		}
	}

	provisioner "remote-exec" {
		inline = [
			"sudo chmod +x ~/nginx_provisioner.sh",
			"~/nginx_provisioner.sh  -a ${aws_instance.api_server.public_ip} -c ${aws_instance.client_server.public_ip} -p ${aws_instance.proxy_server.public_ip}"
		]

		connection {
			user = "ubuntu"
			private_key = "${file("~/Downloads/fre.pem")}"
			type = "ssh"
		}
	}
}

resource "aws_security_group" "api_server" {
	name = "api_server"

	ingress {
		from_port = 0
		to_port = 0
		protocol = -1
		cidr_blocks = ["0.0.0.0/0"]
	}

	egress {
		from_port = 0
		to_port = 0
		protocol = -1
		cidr_blocks = ["0.0.0.0/0"]
	}
}

output "api_ip" {
	value = "${aws_instance.api_server.public_ip}"
}

output "client_ip" {
	value = "${aws_instance.client_server.public_ip}"
}

output "proxy_ip" {
	value = "${aws_instance.proxy_server.public_ip}"
}

output "web_server_ip" {
	value = "Plainview live on ${aws_instance.web_server.public_ip}"
}