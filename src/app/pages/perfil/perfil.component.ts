import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  abaAtiva: 'perfil' | 'contato' = 'perfil';
  user: User | any = null;

  perfilForm: FormGroup;
  contatoForm: FormGroup;

  interessesDisponiveis = [
    'Tecnologia', 'Inovação', 'Empreendedorismo', 'Startups',
    'Investimentos', 'Networking', 'Eventos', 'Marketing',
    'Design', 'Dados', 'IA', 'Blockchain'
  ];

  mensagemEnviada = false;
  perfilAtualizado = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.perfilForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      empresa: [''],
      cargo: [''],
      cidade: [''],
      estado: [''],
      bio: [''],
      linkedin: [''],
      github: [''],
      website: [''],
      interesses: [[]]
    });

    this.contatoForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      assunto: ['', Validators.required],
      mensagem: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.userService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.perfilForm.patchValue(user);
        // Preencher formulário de contato com dados do usuário
        this.contatoForm.patchValue({
          nome: user.nome,
          email: user.email
        });
      }
    });
  }

  selecionarAba(aba: 'perfil' | 'contato'): void {
    this.abaAtiva = aba;
    this.mensagemEnviada = false;
    this.perfilAtualizado = false;
  }

  salvarPerfil(): void {
    if (this.perfilForm.valid) {
      this.userService.updateProfile(this.perfilForm.value);
      this.perfilAtualizado = true;
      setTimeout(() => {
        this.perfilAtualizado = false;
      }, 3000);
    }
  }

  enviarMensagem(): void {
    if (this.contatoForm.valid) {
      this.userService.enviarMensagem(this.contatoForm.value);
      this.mensagemEnviada = true;
      this.contatoForm.reset({
        nome: this.user?.nome || '',
        email: this.user?.email || ''
      });
      setTimeout(() => {
        this.mensagemEnviada = false;
      }, 5000);
    }
  }

  toggleInteresse(interesse: string): void {
    const interesses = this.perfilForm.get('interesses')?.value || [];
    const index = interesses.indexOf(interesse);
    if (index > -1) {
      interesses.splice(index, 1);
    } else {
      interesses.push(interesse);
    }
    this.perfilForm.patchValue({ interesses });
  }

  isInteresseSelecionado(interesse: string): boolean {
    const interesses = this.perfilForm.get('interesses')?.value || [];
    return interesses.includes(interesse);
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
